import { forwardRef, useLayoutEffect, useState } from 'react';
import { Link } from 'react-router';
import cn from 'classnames';

import { noop } from 'lodash';
import { useSelector } from 'react-redux';
import { pluralForm } from '../utils';
import { ButtonLink } from './button-link';
import styles from './dropdown-menu.module.scss';
import TimeDisplay from './time-display';
import { useCommentLikers } from './comment-likers';

export const PostCommentMoreMenu = forwardRef(function PostCommentMore(
  {
    id,
    authorUsername,
    doEdit,
    doDelete,
    doReply,
    doMention,
    doLike,
    doUnlike,
    doShowLikes,
    getBackwardIdx,
    createdAt,
    updatedAt,
    permalink,
    doAndClose,
    likesCount,
    fixed = false,
  },
  menuRef,
) {
  const { status, likers } = useCommentLikers(id);
  const myUsername = useSelector((state) => state.user.username);
  const bIdx = getBackwardIdx();
  const arrows = bIdx <= 3 ? '^'.repeat(bIdx) : `^^^\u2026`;
  const likersText = status.success
    ? likers.length > 0 && likersMenuText(likers, myUsername)
    : likesCount > 0 && `Show ${pluralForm(likesCount, 'like')}\u2026`;
  const menuGroups = [
    [
      doLike && (
        <div key="like" className={styles.item}>
          <ButtonLink onClick={doLike} className={styles.link}>
            Like comment
          </ButtonLink>
        </div>
      ),
      doUnlike && (
        <div key="unlike" className={styles.item}>
          <ButtonLink onClick={doUnlike} className={styles.link}>
            Unlike comment
          </ButtonLink>
        </div>
      ),
      likersText && (
        <div key="likes" className={styles.item}>
          <ButtonLink className={styles.link} onClick={doShowLikes}>
            {likersText}
          </ButtonLink>
        </div>
      ),
    ],
    [
      doEdit && (
        <div key="edit" className={styles.item}>
          <ButtonLink onClick={doEdit} className={styles.link}>
            Edit this comment
          </ButtonLink>
        </div>
      ),
      doDelete && (
        <div key="delete" className={styles.item}>
          <ButtonLink onClick={doDelete} className={styles.link}>
            Delete this comment
          </ButtonLink>
        </div>
      ),
    ],
    [
      doMention && (
        <div key="mention" className={styles.item}>
          <ButtonLink onClick={doMention} className={styles.link}>
            Reply to @{authorUsername}
          </ButtonLink>
        </div>
      ),
      doReply && (
        <div key="reply" className={styles.item}>
          <ButtonLink onClick={doReply} className={styles.link}>
            Reply with {arrows}
          </ButtonLink>
        </div>
      ),
    ],
    [
      <div key="created-on" className={cn(styles.item, styles.content)}>
        Created on <TimeDisplay timeStamp={+createdAt} inline absolute />
      </div>,
      updatedAt - createdAt > 120000 && (
        <div key="updated-on" className={cn(styles.item, styles.content)}>
          Updated on <TimeDisplay timeStamp={+updatedAt} inline absolute />
        </div>
      ),
      <div key="permalink" className={cn(styles.item, styles.content)}>
        <Link to={permalink} style={{ marginRight: '1ex' }} onClick={doAndClose(noop)}>
          Link to comment
        </Link>{' '}
        <button
          className="btn btn-default btn-sm"
          type="button"
          onClick={doAndClose(copyURL)}
          value={permalink}
          aria-label="Copy link"
        >
          Copy
        </button>
      </div>,
    ],
  ];

  const [initial, setInitial] = useState(true);
  useLayoutEffect(() => setInitial(false), []);

  return (
    <>
      {fixed && <div className={cn(styles.shadow, initial && styles.initial)} />}
      <div
        ref={menuRef}
        className={cn(
          styles.list,
          styles.focusList,
          initial && styles.initial,
          fixed && styles.fixedList,
        )}
      >
        {menuGroups.map((group, i) => {
          const items = group.filter(Boolean);
          if (items.length === 0) {
            return null;
          }
          return (
            <div className={styles.group} key={`group-${i}`}>
              {items}
            </div>
          );
        })}
      </div>
    </>
  );
});

function copyURL({ target }) {
  target.blur();

  // Creating absolute URL
  const link = document.createElement('a');
  link.href = target.value;

  const textNode = document.body.appendChild(document.createTextNode(link.href));

  const range = new Range();
  const selection = document.getSelection();

  range.selectNode(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();

  textNode.parentNode.removeChild(textNode);
}

function likersMenuText(likers, myUsername) {
  if (likers.length === 0) {
    return `No likes`;
  } else if (likers.length === 1) {
    return `Liked by  ${usernames(likers, myUsername)[0]}`;
  } else if (likers.length <= 4) {
    return `Liked by  ${andJoin(usernames(likers, myUsername))}`;
  }
  const cutAfter = 2;
  return `Liked by ${andJoin([
    ...usernames(likers.slice(0, cutAfter), myUsername),
    `${likers.length - cutAfter} more\u2026`,
  ])}`;
}

function andJoin(items) {
  if (items.length <= 1) {
    return items.join('');
  }
  const head = [...items];
  const tail = head.pop();
  return `${head.join(', ')} and ${tail}`;
}

function usernames(users, myUsername) {
  return users.map((u) => (u.username === myUsername ? 'you' : `@${u.username}`));
}
