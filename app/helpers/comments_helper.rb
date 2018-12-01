module CommentsHelper

  def get_delete_link_attributes(comment)
    {
        #class: "confirmed",
        method: :delete,
        title: t('tooltips.delete_comment'),
        remote: true,
        data: { confirm: "Bist du sicher?" }
    }
  end

  def get_edit_link_attributes(comment)
    {
        id: "edit_comment_#{comment.id}",
        class: "edit_comment",
        title: t('tooltips.edit_comment')
    }
  end

end
